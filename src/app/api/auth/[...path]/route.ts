import {
  handleAuthDelete,
  handleAuthGet,
  handleAuthPatch,
  handleAuthPost,
  handleAuthPut,
} from "@/lib/auth/route-handler";

export const runtime = "nodejs";

export const GET = handleAuthGet;
export const POST = handleAuthPost;
export const PUT = handleAuthPut;
export const DELETE = handleAuthDelete;
export const PATCH = handleAuthPatch;
