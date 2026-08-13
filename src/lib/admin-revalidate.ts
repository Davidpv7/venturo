import { revalidatePath } from "next/cache";

export function revalidateRoomPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/homes");
  revalidatePath("/rent-a-room", "layout");
  revalidatePath("/", "layout");
}
