export function createServerFn(options?: { method?: "GET" | "POST" }) {
  const builder = {
    middleware(_middlewares: any[]) {
      return builder;
    },
    validator<TInput>(validatorFn?: (input: TInput) => TInput) {
      return {
        handler<TOutput>(handlerFn: (ctx: { data: TInput; context: any }) => Promise<TOutput>) {
          const fn = async (arg?: { data?: TInput } | TInput): Promise<TOutput> => {
            const data =
              arg && typeof arg === "object" && "data" in arg
                ? (arg as { data: TInput }).data
                : (arg as TInput);
            const validated = validatorFn ? validatorFn(data) : data;
            const context = {
              userId: "usr_admin",
              claims: { sub: "usr_admin", email: "admin@brandium.com", role: "admin" },
            };
            return handlerFn({ data: validated, context });
          };
          return fn;
        },
      };
    },
    handler<TOutput>(handlerFn: (ctx: { data: any; context: any }) => Promise<TOutput>) {
      const fn = async (arg?: any): Promise<TOutput> => {
        const context = {
          userId: "usr_admin",
          claims: { sub: "usr_admin", email: "admin@brandium.com", role: "admin" },
        };
        const data = arg && typeof arg === "object" && "data" in arg ? arg.data : arg;
        return handlerFn({ data, context });
      };
      return fn;
    },
  };

  return builder;
}

export function createMiddleware(options?: any) {
  return {
    server: (fn: any) => fn,
    client: (fn: any) => fn,
  };
}

export const useServerFn = <T>(fn: T): T => fn;
