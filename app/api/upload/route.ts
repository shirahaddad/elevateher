import { NextResponse } from 'next/server';
import multer from 'multer';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Request, NextFunction } from 'express';

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, join(process.cwd(), 'public', 'images', 'blog'));
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

export async function POST(req: Request) {
  try {
    // Use multer to handle the file upload
    await new Promise((resolve, reject) => {
      const next: NextFunction = (err?: any) => {
        if (err) reject(err);
        else resolve(undefined);
      };
      upload.single('image')(req as any, {} as any, next);
    });

    // Return the file path or URL
    return NextResponse.json({ success: true, message: 'Image uploaded successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 });
  }
} 