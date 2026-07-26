import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";
import ai from "../configs/ai.js";
import path from "path";
import fs from 'fs'
import { v2 as cloudinary} from 'cloudinary'

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",

  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",

  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",

  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",

  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",

  // New Styles 👇

  Gaming:
    "professional YouTube gaming thumbnail, AAA game artwork, action scene, explosive visual effects, glowing weapons, esports, streamer face reaction, bold typography space, vibrant colors, highly detailed, ultra HD, click-worthy",

  Cinematic:
    "cinematic movie poster style, dramatic lighting, wide-angle composition, realistic shadows, blockbuster atmosphere, emotional storytelling, premium film look, ultra detailed",

  Anime:
    "anime style thumbnail, colorful anime characters, expressive eyes, cel-shaded artwork, manga-inspired composition, vibrant Japanese animation aesthetic, dynamic action pose",

  Horror:
    "dark horror thumbnail, creepy atmosphere, terrifying shadows, haunted background, blood-red lighting, suspenseful mood, scary cinematic look, eerie fog, horror movie poster style",

  Neon: "cyberpunk neon thumbnail, glowing pink and blue lights, futuristic city, synthwave aesthetic, electric glow, vibrant neon effects, modern digital art, high contrast lighting",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",

  // Gaming Colors
  "gaming-red":
    "intense gaming red palette, fiery red highlights, black shadows, aggressive esports atmosphere",

  "gaming-blue":
    "electric blue gaming palette, futuristic blue lighting, energetic esports style, glowing effects",

  "gaming-green":
    "vibrant green gaming palette, toxic green glow, energetic cyber gaming atmosphere",

  cyberpunk:
    "cyberpunk neon palette, glowing magenta and cyan lights, futuristic city ambience, high-tech aesthetic",

  fire: "fiery orange, red and yellow tones, explosive energy, dramatic heat effects",

  ice: "icy blue and white colors, frozen atmosphere, crystal clear lighting, cool cinematic mood",

  gold: "luxurious gold palette, premium metallic tones, elegant highlights, rich and royal atmosphere",

  royal:
    "royal blue and purple palette, premium luxury colors, majestic cinematic feel",

  toxic:
    "radioactive green palette, toxic glow, post-apocalyptic gaming atmosphere",

  blood:
    "dark blood red palette, black shadows, horror-inspired dramatic lighting",

  galaxy:
    "deep space colors, cosmic purple and blue tones, glowing stars, futuristic universe aesthetic",

  retro:
    "retro 80s palette, vintage orange and blue colors, nostalgic synthwave atmosphere",
};

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    const model = "gemini-3-pro-image-preview";

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspect_ratio || "16:9",
        imageSize: "1K",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        },
      ],
    };

    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

    if(color_scheme){
        prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color_scheme.`
    }

    if(user_prompt){
        prompt += `Additional details: ${user_prompt}.`
    }

    prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`

    // generate the image using ai model
    const response: any = await  ai.models.generateContent({
        model,
        contents: [prompt],
        config: generationConfig
    })

    // check if the response is valid
    if(!response?.candidates?.[0]?.content?.parts){
        throw new Error('Unexpected response')
    }

    const parts = response.candidates[0].content.parts;

    let finalBuffer: Buffer | null = null;

    for (const part of parts){
      if(part.inlineData){
        finalBuffer = Buffer.from(part.inlineData.data, 'base64')
      }  
    }

    const filename = `final-output-${Date.now()}.png`;
    const filePath = path.join('images', filename);

    // create the image directory if it doesn't exist
    fs.mkdirSync('images', {recursive: true})

    // write the final image to the file
    fs.writeFileSync(filePath, finalBuffer!);

    const uploadResult = await cloudinary.uploader.upload(filePath, {resource_type: 'image'})

    thumbnail.image_url = uploadResult.url;
    thumbnail.isGenerating = false;
    await thumbnail.save()

    res.json({message: 'Thumbnail Generated', thumbnail})

    // remove image file form disk
    fs.unlinkSync(filePath)
  } catch (error: any) {
    console.log(error);
    res.status(500).json({message: error.message});
  }
};


// controlers for thumbnail deletion
export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {userId} = req.session;

        await Thumbnail.findByIdAndDelete({_id: id, userId})

        res.json({message: 'Thumbnail deleted successfully'});
    } catch (error:any) {
         console.log(error);
    res.status(500).json({message: error.message});
    }
}