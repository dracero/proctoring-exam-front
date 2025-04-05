import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/core/providers/google"
import { GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private"

/*
export const handle = SvelteKitAuth({
  providers: [Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET })],
})
*/

export const  handle  = SvelteKitAuth({
  providers: [
      Google({
          clientId: GOOGLE_ID,
          clientSecret: GOOGLE_SECRET,
          authorization: {
              params: { scope: 'openid email profile' },
          },

      })
  ],
  callbacks: {
      async jwt({ token, account }) {
          if (account) {
            token.accessToken = account.access_token;
            console.log(token.accessToken)
            }
          return token;
      },
      async session({ session, token, user }) {
          //@ts-ignore
          session.access_token = token.accessToken;
          console.log(token.accessToken)
          return session;
      }
    }
});