import type React from "react";
import { thumbnailStyles, type ThumbnailStyle } from "../assets/assets";
import {
  CpuIcon,
  ImageIcon,
  PenToolIcon,
  SquareIcon,
  SparkleIcon,
  ChevronDownIcon,
  Gamepad2Icon,
  ClapperboardIcon,
  PaletteIcon,
  GhostIcon,
  ZapIcon,
} from "lucide-react";

const StyleSelector = ({
  value,
  onChange,
  isOpen,
  setIsOpen,
}: {
  value: ThumbnailStyle;
  onChange: (style: ThumbnailStyle) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const styleDescription: Record<ThumbnailStyle, string> = {
    "Bold & Graphic": "High contrast, bold typography, striking visuals",
    Minimalist: "Clean, simple, lost of white space",
    Photorealistic: "Photo-based, natural looking",
    Illustrated: "Hand-drawn, artistic, creative",
    "Tech/Futuristic": "Modern, sleek, tech-inspired",

    // adding extra this is for my 👇
    Gaming: "Vibrant gaming artwork, action scenes, bold colors",
    Cinematic: "Movie-style lighting, dramatic composition",
    Anime: "Anime-inspired characters and colorful visuals",
    Horror: "Dark atmosphere, creepy lighting, suspenseful mood",
    Neon: "Bright neon glow, cyberpunk-inspired visuals",
  };

  const styleIcons: Record<ThumbnailStyle, React.ReactNode> = {
    "Bold & Graphic": <SparkleIcon className="h-4 w-4" />,
    Minimalist: <SquareIcon className="h-4 w-4" />,
    Photorealistic: <ImageIcon className="h-4 w-4" />,
    Illustrated: <PenToolIcon className="h-4 w-4" />,
    "Tech/Futuristic": <CpuIcon className="h-4 w-4" />,

    // adding extra this is for my 👇
    Gaming: <Gamepad2Icon className="h-4 w-4" />,
    Cinematic: <ClapperboardIcon className="h-4 w-4" />,
    Anime: <PaletteIcon className="h-4 w-4" />,
    Horror: <GhostIcon className="h-4 w-4" />,
    Neon: <ZapIcon className="h-4 w-4" />,
  };

  return (
    <div className="relative space-y-3 dark">
      <label className="block text-sm font-medium text-zinc-200">
        Thumbnail Style
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition bg-white/8 border-white/10 text-zinc-200 hover:bg-white/12"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-medium">
            {styleIcons[value]}
            <span>{value}</span>
          </div>
          <p className="text-xs text-zinc-400">{styleDescription[value]}</p>
        </div>
        <ChevronDownIcon
          className={[
            "h-5 w-5 text-zinc-400 transition-transform",
            isOpen && "rotate-180",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          onWheel={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-full left-0 mt-2 w-full max-h-72 overflow-y-auto overscroll-contain custom-scrollbar rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl z-50"
        >
          {thumbnailStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => {
                onChange(style);
                setIsOpen(false);
              }}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-black/30"
            >
              <div className="mt-0.5">{styleIcons[style]}</div>
              <div>
                <p className="font-medium">{style}</p>
                <p className="text-xs text-zinc-400">
                  {styleDescription[style]}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
