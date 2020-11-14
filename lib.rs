use byteorder::{ByteOrder, LittleEndian};

use solana_sdk::{
    account_info::{next_account_info, AccountInfo},
    // entrypoint,
    // entrypoint::ProgramResult,
    entrypoint_deprecated,
    entrypoint_deprecated::ProgramResult,
    info,
    program_error::ProgramError,
    pubkey::Pubkey,
};

use std::mem;

// Declare and export the program's entrypoint
// entrypoint!(process_instruction);
entrypoint_deprecated!(process_instruction);

// Program entrypoint's implementation
fn process_instruction(
    program_id: &Pubkey,      // Public key of program account
    accounts: &[AccountInfo], // data accounts
    instruction_data: &[u8],  // 1 = vote for A, 2 = vote for B
) -> ProgramResult {
    info!("Rust program entrypoint");

    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account that holds the vote count
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        info!("Vote account is not owned by the program");
        return Err(ProgramError::IncorrectProgramId);
    }

    // The data must be large enough to hold two u32 vote counts
    // in the next (slightly more complicated) version of the
    // program we will use solana_sdk::program_pack::Pack
    // to retrieve and deserialise the account data
    // and to check it is the correct length
    // for now, realise it's literally just 8 bytes of data.

    if account.try_data_len()? < 2 * mem::size_of::<u32>() {
        info!("Vote account data length too small for u32");
        return Err(ProgramError::InvalidAccountData);
    }

    let mut data = account.try_borrow_mut_data()?;

    let mut vc = LittleEndian::read_u32(&data[0..4]);
    if vc == 0 {
        // the first 4 bytes are a u32 (unsigned integer) in little endian format
        // holding the number of votes for candidate 1

        // we read the data from the account into the u32 variable vc

        // increment by 1
        vc = instruction_data[0].into();

        // write the u32 number back to the first 4 bytes
        LittleEndian::write_u32(&mut data[0..4], vc);

        info!("Wrote issue number");
    }

    let mut vc = LittleEndian::read_u32(&data[4..8]);
    vc += 1;
    LittleEndian::write_u32(&mut data[4..8], vc);
    info!("Updated vote");

    Ok(())
}
