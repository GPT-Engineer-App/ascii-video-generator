import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [asciiFrames, setAsciiFrames] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    setVideoFile(URL.createObjectURL(event.target.files[0]));
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const asciiChars = "@%#*+=-:. ";

    const convertToAscii = (frameData, width, height) => {
      let asciiStr = "";
      for (let y = 0; y < height; y += 4) { // Increase vertical resolution
        for (let x = 0; x < width; x += 2) { // Increase horizontal resolution
          const offset = (y * width + x) * 4;
          const r = frameData[offset];
          const g = frameData[offset + 1];
          const b = frameData[offset + 2];
          const avg = (r + g + b) / 3;
          const charIndex = Math.floor((avg / 255) * (asciiChars.length - 1));
          asciiStr += asciiChars[charIndex];
        }
        asciiStr += "\n";
      }
      return asciiStr;
    };

    const processFrame = () => {
      if (video.paused || video.ended) return;

      const aspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = 160 * aspectRatio; // Adjust canvas width based on aspect ratio
      canvas.height = 160; // Fixed height for better resolution

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const asciiStr = convertToAscii(frameData, canvas.width, canvas.height);
      setAsciiFrames((prevFrames) => [...prevFrames, asciiStr]);

      requestAnimationFrame(processFrame);
    };

    video.addEventListener("play", processFrame);
  };

  useEffect(() => {
    if (videoFile) {
      const video = videoRef.current;
      video.addEventListener("play", handleVideoPlay);
      return () => {
        video.removeEventListener("play", handleVideoPlay);
      };
    }
  }, [videoFile]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl text-center">Video to ASCII Converter</h1>
      <Input type="file" accept="video/*" onChange={handleFileChange} />
      {videoFile && (
        <div className="flex flex-col items-center space-y-4">
          <video ref={videoRef} src={videoFile} controls className="w-full max-w-md" />
          <canvas ref={canvasRef} className="hidden"></canvas>
          <Button onClick={handleVideoPlay}>Convert to ASCII</Button>
          <pre className="whitespace-pre-wrap text-xs leading-none">
            {asciiFrames[asciiFrames.length - 1]}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Index;