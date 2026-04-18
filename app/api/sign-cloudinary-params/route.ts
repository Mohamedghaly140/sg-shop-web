import { cloudinary } from "@/lib/cloudinary";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const { paramsToSign } = await request.json();

  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

  return Response.json({ signature });
}
