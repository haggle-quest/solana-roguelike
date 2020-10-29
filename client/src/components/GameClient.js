import React, { useRef, useEffect } from "react";

const GameClient = (props) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    //Our first draw
    context.fillStyle = "#000000";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        style={{
          width: "640px",
          height: "500px",
        }}
        ref={canvasRef}
        {...props}
      />
    </div>
  );
};

export default GameClient;
