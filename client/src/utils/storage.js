const types = ["localStorage"];

const storage = {
  get: (value, type = "localStorage") => {
    if (!types.includes(type)) {
      return null;
    }
    const fetchedValue = window[type].getItem(value);
    let returnValue = null;
    if (fetchedValue) {
      try {
        returnValue = JSON.parse(fetchedValue);
      } catch (e) {
        console.error(e);
      }
    }
    return returnValue;
  },
  set: (key, value, type = "localStorage") => {
    if (!types.includes(type)) {
      return;
    }
    window[type].setItem(key, JSON.stringify(value));
  },
};

export default storage;
