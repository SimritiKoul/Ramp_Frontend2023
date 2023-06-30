import { useCallback, useContext, useState } from "react"
import { AppContext } from "../utils/context"

export function useWrappedRequest() {
  const [loading, setLoading] = useState(false)
  const { setError } = useContext(AppContext)

  const wrappedRequest = useCallback(
    async <TData extends any = void>(promise: () => Promise<TData>): Promise<TData | null> => {
      /*
        Bug 6: I added a condition 'isLastPage' to set the loading value to true or false. If 'nextPage' is null, then 'isLastPage' is set to true.
      */
      let isLastPage = false
      try {
        setLoading(true)
        const result = await promise()

        /* 
          this condition will work only if result is object and not null
          so we can avoid the warning
        */
        if (
          typeof result === "object" &&
          result !== null &&
          "nextPage" in Object(result) &&
          Object(result).nextPage === null
        ) {
          isLastPage = true
        }
        return result
      } catch (error) {
        setError(error as string)
        return null
      } finally {
        if (!isLastPage) {
          setLoading(false)
        }
      }
    },
    [setError]
  )

  return { loading, wrappedRequest }
}
