import Vapi from "@vapi-ai/web";

// Define the type for the Vapi client
type VapiClient = Vapi | null;

let _vapi: VapiClient = null;

/**
 * Lazily return a Vapi client instance. Validates that the API key is present
 * and throws a clear error if not. This prevents module-level crashes when
 * environment variables are missing during build or import.
 */
export function getVapi(): Vapi {
	const key = process.env.NEXT_PUBLIC_VAPI_API_KEY;
	if (!key) {
		throw new Error("Missing environment variable NEXT_PUBLIC_VAPI_API_KEY.\n" +
			"Vapi client must be instantiated at runtime where the key is available.");
	}

	if (!_vapi) {
		// Defer to runtime to create the client
		_vapi = new Vapi(key);
	}

	return _vapi;
}

export default getVapi;

// Provide a named `vapi` export that behaves like the Vapi instance but lazily
// initializes it on first access.
export const vapi: Vapi = new Proxy(
	{} as Vapi,
	{
		get(_, prop: string | symbol) {
			const instance = getVapi();
      // Safe cast because we know 'prop' is being accessed on the Vapi interface
			const value = instance[prop as keyof Vapi];
			if (typeof value === 'function') {
        // Bind the function to the correct 'this' context
        return value.bind(instance);
      }
			return value;
		},
		set(_, prop: string | symbol, val) {
			const instance = getVapi();
      // FIX: We allow setting properties, but logically this proxy is mostly for method access.
      // This cast is still necessary to satisfy TS constraints on the Proxy target vs handler,
      // but we've removed the 'any' cast on the instance itself in the getter.
      (instance as unknown as Record<string | symbol, any>)[prop] = val;
			return true;
		},
	}
);