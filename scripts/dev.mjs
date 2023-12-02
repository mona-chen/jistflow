import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

(async () => {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));

	await execa("pnpm", ["clean"], {
		cwd: join(__dirname, "/../"),
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["dlx", "gulp", "watch"], {
		cwd: join(__dirname, "/../"),
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "backend", "watch"], {
		cwd: join(__dirname, "/../"),
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "client", "watch"], {
		cwd: join(__dirname, "/../"),
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "sw", "watch"], {
		cwd: join(__dirname, "/../"),
		stdout: process.stdout,
		stderr: process.stderr,
	});

	const start = async () => {
		try {
			await execa("pnpm", ["start"], {
				cwd: join(__dirname, "/../"),
				stdout: process.stdout,
				stderr: process.stderr,
			});
		} catch (e) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			start();
		}
	};

	start();
})();
