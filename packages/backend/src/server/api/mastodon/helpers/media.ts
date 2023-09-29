import { addFile } from "@/services/drive/add-file.js";
import { ILocalUser } from "@/models/entities/user.js";
import multer from "@koa/multer";
import { DriveFiles } from "@/models/index.js";
import { Packed } from "@/misc/schema.js";
import { DriveFile } from "@/models/entities/drive-file.js";

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

	public static async updateMedia(user: ILocalUser, file: DriveFile, body: any): Promise<Packed<"DriveFile">> {
		await DriveFiles.update(file.id, {
			comment: body?.description ?? undefined
		});

		return DriveFiles.findOneByOrFail({id: file.id, userId: user.id})
			.then(p => DriveFiles.pack(p));
	}

	public static async getMediaPacked(user: ILocalUser, id: string): Promise<Packed<"DriveFile"> | null> {
		return this.getMedia(user, id)
			.then(p => p ? DriveFiles.pack(p) : null);
	}

	public static async getMedia(user: ILocalUser, id: string): Promise<DriveFile | null> {
		return DriveFiles.findOneBy({id: id, userId: user.id});
	}
}
