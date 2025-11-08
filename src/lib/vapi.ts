import Vapi from "@vapi-ai/web";

// FIX #8 (Bug #8): Define the type for the Vapi client
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
// initializes it on first access. This keeps existing imports such as
// `import { vapi } from '@/lib/vapi'` working while still avoiding
// module-level instantiation.

// FIX #8 (Bug #8): Replace 'any' with the actual 'Vapi' type
export const vapi: Vapi = new Proxy(
	{},
	{
		get(_, prop: keyof Vapi) {
			const instance = getVapi();
			const value = instance[prop];
			if (typeof value === 'function') {
        // Bind the function to the correct 'this' context
        return (value as (...args: any[]) => any).bind(instance);
      }
			return value;
		},
		set(_, prop: keyof Vapi, val) {
			const instance = getVapi();
			(instance as any)[prop] = val; // Use 'any' here for broad compatibility
			return true;
		},
	}
) as Vapi;