<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [iceshrimp-js](./iceshrimp-js.md) &gt; [ChannelConnection](./iceshrimp-js.channelconnection.md) &gt; [send](./iceshrimp-js.channelconnection.send.md)

## ChannelConnection.send() method

**Signature:**

```typescript
send<T extends keyof Channel["receives"]>(
		type: T,
		body: Channel["receives"][T],
	): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | T |  |
|  body | Channel\["receives"\]\[T\] |  |

**Returns:**

void
