import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ffmpeg from "ffmpeg.js/ffmpeg-mp4";
import ascii from "ascii-art";

const Index = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [asciiFrames, setAsciiFrames] = useState([]);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!videoFile) {
      toast.error("Please upload a video file first.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const videoData = new Uint8Array(event.target.result);
        const result = ffmpeg({
          MEMFS: [{ name: "video.mp4", data: videoData }],
          arguments: ["-i", "video.mp4", "-vf", "fps=1", "frame%d.png"],
          stdin: () => {},
        });

        const frames = result.MEMFS.filter((file) => file.name.endsWith(".png"));
        const asciiFrames = await Promise.all(
          frames.map(async (frame) => {
            const image = new Image();
            image.src = URL.createObjectURL(new Blob([frame.data]));
            await new Promise((resolve) => (image.onload = resolve));
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const asciiArt = await ascii.image({
              data: imageData,
              width: canvas.width,
              height: canvas.height,
            });
            return asciiArt;
          })
        );

        setAsciiFrames(asciiFrames);
      };
      reader.readAsArrayBuffer(videoFile);
    } catch (error) {
      toast.error("An error occurred while converting the video.");
      console.error(error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4">
      <div>
        <Label htmlFor="video-upload">Upload Video</Label>
        <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} />
      </div>
      <Button onClick={handleConvert}>Convert to ASCII</Button>
      <ScrollArea className="w-full h-96 mt-4 border p-4">
        {asciiFrames.map((frame, index) => (
          <pre key={index}>{frame}</pre>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Index;