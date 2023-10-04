<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-js](./iceshrimp-js.md) &gt; [entities](./iceshrimp-js.entities.md) &gt; [ServerInfo](./iceshrimp-js.entities.serverinfo.md)

## entities.ServerInfo type

**Signature:**

```typescript
export declare type ServerInfo = {
	machine: string;
	cpu: {
		model: string;
		cores: number;
	};
	mem: {
		total: number;
	};
	fs: {
		total: number;
		used: number;
	};
};
```