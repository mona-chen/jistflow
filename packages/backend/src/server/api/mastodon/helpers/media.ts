import { addFile } from "@/services/drive/add-file.js";
import { ILocalUser } from "@/models/entities/user.js";
import multer from "@koa/multer";
import { DriveFiles } from "@/models/index.js";
import { Packed } from "@/misc/schema.js";

export class MediaHelpers {
	public static async uploadMedia(user: ILocalUser, file: multer.File, body: any): Promise<Packed<"DriveFile">> {
		return await addFile({
			user: user,
			path: file.path,
			name: file.originalname !== null && file.originalname !== 'file' ? file.originalname : undefined,
			comment: body?.description ?? undefined,
			sensitive: false, //FIXME: this needs to be updated on from composing a post with the media attached
		})
			.then(p => DriveFiles.pack(p));
	}

	public static async getMedia(user: ILocalUser, id: string): Promise<Packed<"DriveFile"> | null> {
		return DriveFiles.findOneBy({id: id, userId: user.id})
			.then(p => p ? DriveFiles.pack(p) : null);
	}
}
