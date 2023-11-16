import type { entities } from "firefish-js";

export const notePage = (note: entities.Note) => {
	return `/notes/${note.id}`;
};
