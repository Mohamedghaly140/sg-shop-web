"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

const deleteSubcategorySchema = z.object({
  subcategoryId: z.string().min(1, "Subcategory is required"),
});

export async function deleteSubcategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { subcategoryId } = deleteSubcategorySchema.parse({
      subcategoryId: formData.get("subcategoryId"),
    });

    await prisma.subCategory.delete({ where: { id: subcategoryId } });

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Subcategory deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

