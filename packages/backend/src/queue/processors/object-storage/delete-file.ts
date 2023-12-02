import type { ObjectStorageFileJobData } from "@/queue/types.js";
import { deleteObjectStorageFile } from "@/services/drive/delete-file.js";
import type Bull from "bull";

export default async (job: Bull.Job<ObjectStorageFileJobData>) => {
	const key: string = job.data.key;

	await deleteObjectStorageFile(key);

	return "Success";
};
