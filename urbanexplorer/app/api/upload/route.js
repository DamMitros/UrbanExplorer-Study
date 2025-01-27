import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images');
    const urls = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${uuidv4()}-${file.name}`;
      const filepath = path.join(process.cwd(), 'public/uploads', filename);
      
      await writeFile(filepath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return new Response(JSON.stringify({ urls }), { status: 200 });
  } catch (error) {
    console.error('Error dodając zdjęcie:', error);
    return new Response(
      JSON.stringify({ error: 'Error dodając zdjęcie' }), 
      { status: 500 }
    );
  }
}