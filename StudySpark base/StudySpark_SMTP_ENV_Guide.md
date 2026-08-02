# StudySpark SMTP and `.env` Configuration Guide

This guide configures StudySpark to send real email-verification messages through Brevo SMTP. It covers both local Docker testing and the public backend deployed on Render.

> Never place real database passwords, API keys, JWT secrets, SMTP keys, or other credentials in `.env.example`, GitHub, screenshots, reports, or chat messages.

## 1. Understand the three configuration locations

| Location | Purpose | Contains real secrets? | Used by |
|---|---|---:|---|
| `StudySpark base/.env.example` | Documents the variables that developers need | No | Nobody automatically |
| `StudySpark base/backend/.env` | Private configuration for local Docker | Yes | Local backend container |
| Render backend → Environment | Private configuration for the cloud deployment | Yes | Public Render backend |

Editing `.env.example` does not configure the running application. The real local values belong in `backend/.env`. Render cannot access that private local file, so the cloud values must also be entered in Render.

## 2. Why StudySpark uses Brevo port 2525

StudySpark uses Nodemailer to connect to an SMTP provider. Brevo supplies the mail server that delivers verification messages.

Free Render web services block outbound connections on standard SMTP ports `25`, `465`, and `587`. Brevo also supports port `2525`, so use:

```dotenv
SMTP_PORT=2525
SMTP_SECURE=false
```

- Render free-service restrictions: <https://render.com/docs/free>
- Brevo SMTP integration: <https://developers.brevo.com/docs/smtp-integration>
- Brevo Free plan information: <https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans>

## 3. Create a free Brevo account

1. Go to <https://www.brevo.com/>.
2. Select **Sign up free**.
3. Register and verify the Brevo account email.
4. Complete any account activation steps Brevo displays.
5. Remain on the **Free** plan. A paid plan is not required for normal StudySpark assessment testing.

Brevo's help centre currently describes its Free plan as free indefinitely, with no credit card required and up to 300 email sends per day.

## 4. Add and verify a sender

The verified sender is the address displayed in the `From` field of StudySpark emails.

1. Sign in to Brevo.
2. Open the account dropdown.
3. Go to **Settings → Senders, Domains & Dedicated IPs → Senders**.
4. Select **Add a sender**.
5. Enter:

   ```text
   Name: StudySpark
   Email: an email address you can access
   ```

6. Save the sender.
7. Copy the verification code Brevo sends to that address.
8. Enter the code in Brevo and select **Verify sender**.
9. Confirm that the sender is displayed as verified.

For a student demonstration, an individually verified sender address can be used. A custom email domain is not required for basic testing.

Official instructions: <https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email>

## 5. Obtain the Brevo SMTP Login and SMTP key

1. Open the Brevo account dropdown.
2. Go to **Settings → SMTP & API**.
3. Select the **SMTP** tab.
4. Copy the value displayed as **Login**. This is the value for `SMTP_USER`.
5. Select **Generate a new SMTP key**.
6. Name it `StudySpark SMTP`.
7. Select the **Standard** key type.
8. Choose an appropriate expiry period.
9. Generate the key.
10. Copy and save it immediately. Brevo displays the complete key only once.

Use the credentials as follows:

| StudySpark variable | Brevo value |
|---|---|
| `SMTP_USER` | Login displayed on the Brevo SMTP page |
| `SMTP_PASSWORD` | Generated Brevo SMTP key |

Do not use the Brevo account password or an API key as `SMTP_PASSWORD`. Do not assume that the SMTP Login is the same as the Brevo account email.

Official instructions: <https://help.brevo.com/hc/en-us/articles/7959631848850-Create-and-manage-your-SMTP-keys>

## 6. Configure `.env.example` safely

Open:

```text
StudySpark base/.env.example
```

It may contain this safe, non-secret template:

```dotenv
# Backend
PORT=5000

# Aiven MySQL
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true

# Authentication
JWT_SECRET=use-a-long-random-secret

# Required for AI quiz generation
GEMINI_API_KEY=your-gemini-api-key

# Local default; use the public backend URL in Render
BACKEND_URL=http://localhost:5000

# Brevo email-verification SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-brevo-smtp-login
SMTP_PASSWORD=your-brevo-smtp-key
SMTP_FROM="StudySpark <your-verified-sender@example.com>"

NODE_ENV=development
```

This file can be committed because every sensitive value remains a placeholder.

## 7. Configure the private local `backend/.env`

Open:

```text
StudySpark base/backend/.env
```

Keep the existing real Aiven, JWT, and Gemini values. Add or update these email settings using the real Brevo values:

```dotenv
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=YOUR_ACTUAL_BREVO_SMTP_LOGIN
SMTP_PASSWORD=YOUR_ACTUAL_BREVO_SMTP_KEY
SMTP_FROM="StudySpark <YOUR_ACTUAL_VERIFIED_SENDER_EMAIL>"
BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

Rules:

- Replace every uppercase placeholder with the corresponding real value.
- Do not include angle brackets around `SMTP_USER` or `SMTP_PASSWORD`.
- Do not add spaces around `=`.
- Keep `SMTP_FROM` in quotation marks.
- Use the exact sender address verified in Brevo.
- Ensure each variable appears only once in the file.
- Do not commit `backend/.env`.

## 8. Confirm that `backend/.env` is private

From the repository root, run:

```powershell
git check-ignore -v "StudySpark base/backend/.env"
```

The command should show that `.env` is excluded by a `.gitignore` rule.

Also run:

```powershell
git status
```

`backend/.env` must not appear as a file waiting to be committed. Never force-add it with `git add -f`.

If a real credential was ever committed or shared, immediately rotate that credential and remove it from the repository history using an approved team process.

## 9. Restart the local backend

Changing `.env` does not update an already-running container. From the repository root:

```powershell
cd "StudySpark base"
docker compose up -d --force-recreate backend
```

Check the startup logs:

```powershell
docker compose logs --tail 30 backend
```

## 10. Test SMTP locally

In PowerShell:

```powershell
$testBody = @{
    email = "YOUR_RECEIVING_EMAIL"
} | ConvertTo-Json
```

Then run:

```powershell
Invoke-RestMethod `
    -Method Post `
    -Uri "http://localhost:5000/api/auth/test-email" `
    -ContentType "application/json" `
    -Body $testBody
```

Expected response:

```text
success message
------- -------
True    Test email sent successfully.
```

Check the inbox, spam folder, promotions folder, and Brevo transactional logs. The link in this special test message uses a dummy token and will not verify an account; the purpose is only to confirm delivery.

If the test fails, immediately run:

```powershell
docker compose logs --tail 100 backend
```

Look for the line beginning with:

```text
Test email error:
```

Do not publish the SMTP key while sharing an error message.

## 11. Configure the Render backend

The local `.env` file is not uploaded to Render. Configure the cloud service separately:

1. Open the Render dashboard.
2. Select the backend service `ca2-backend-d886`.
3. Open **Environment**.
4. Add or update the following variables:

| Key | Render value |
|---|---|
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `2525` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | Actual Brevo SMTP Login |
| `SMTP_PASSWORD` | Actual Brevo SMTP key |
| `SMTP_FROM` | `StudySpark <verified-sender@example.com>` |
| `BACKEND_URL` | `https://ca2-backend-d886.onrender.com` |
| `NODE_ENV` | `development` initially |

Important:

- Do not place quotation marks around values in the Render form.
- `BACKEND_URL` must not end with `/`.
- Do not add `/api` to `BACKEND_URL`.
- Confirm that the variable names use the exact capitalization shown above.
- Keep Render's secret values hidden in screenshots.

5. Select **Save Changes** or **Save and Deploy**.
6. Wait until the backend status becomes **Live**.

## 12. Test SMTP through Render

In PowerShell:

```powershell
$testBody = @{
    email = "YOUR_RECEIVING_EMAIL"
} | ConvertTo-Json
```

Then run:

```powershell
Invoke-RestMethod `
    -Method Post `
    -Uri "https://ca2-backend-d886.onrender.com/api/auth/test-email" `
    -ContentType "application/json" `
    -Body $testBody
```

The first request might take longer if the Free Render backend is sleeping. A successful response confirms that Render can connect to Brevo and submit email.

## 13. Test actual account verification

1. Open <https://ca2-studyspark.onrender.com/register>.
2. Register with an email address not already stored in the StudySpark database.
3. Check that inbox for the verification email.
4. Open the email and select the verification link.
5. Confirm that the URL begins with:

   ```text
   https://ca2-backend-d886.onrender.com/api/auth/verify-email?token=
   ```

6. Confirm that only one `/` appears between `.com` and `api`.
7. Expect a response similar to:

   ```json
   {
     "success": true,
     "message": "Email verified successfully. You can now log in."
   }
   ```

8. Log in at <https://ca2-studyspark.onrender.com/login>.

The existing application does not provide a resend-verification endpoint. Use a new test address if an earlier address is already registered and its link is unavailable.

## 14. Development and production mode

While testing, use:

```dotenv
NODE_ENV=development
```

StudySpark will attempt to send the email and also display the development verification link on the registration page. This provides a backup during demonstrations.

After real email delivery works reliably, production behavior can be enabled in Render:

```dotenv
NODE_ENV=production
```

In production mode, the development verification link is hidden. Do not enable production mode until SMTP has been tested successfully, because a failed email would leave a new account unverified without an on-screen fallback link.

## 15. Troubleshooting reference

| Error or symptom | Likely cause | Correction |
|---|---|---|
| `SMTP is not configured` | A required `SMTP_*` variable is missing | Check the exact variable names and restart/redeploy |
| `Unable to send test email` | SMTP connection or message submission failed | Read the backend logs for `Test email error:` |
| `535` or authentication failure | Incorrect SMTP Login or SMTP key | Copy Brevo's displayed Login and generate a new SMTP key |
| Sender rejected or unauthorized | `SMTP_FROM` does not match a verified Brevo sender | Verify that exact sender address |
| `ENOTFOUND` | SMTP host is misspelled | Use `smtp-relay.brevo.com` |
| `ETIMEDOUT` | Port is blocked or unreachable | Test connectivity and confirm port `2525` |
| Works locally on 587 but fails on Render | Free Render blocks port 587 | Use port `2525` on Render |
| Verification URL contains `//api` | `BACKEND_URL` ends with `/` | Remove its trailing slash and redeploy |
| Development link still appears | `NODE_ENV=development` | This is expected during testing |
| Works locally but not publicly | Values exist only in local `.env` | Add them to the Render backend Environment page |
| Test says sent but inbox is empty | Filtering or provider delivery issue | Check spam and Brevo transactional logs |

Brevo SMTP troubleshooting: <https://help.brevo.com/hc/en-us/articles/115000188150-Troubleshooting-Issues-with-Brevo-SMTP>

## 16. Final configuration checklist

- [ ] Brevo account is active on the Free plan.
- [ ] Sender email is verified in Brevo.
- [ ] SMTP Login was copied from Brevo's SMTP page.
- [ ] SMTP key—not an account password or API key—is used.
- [ ] Local `backend/.env` contains the real SMTP values.
- [ ] `.env.example` contains placeholders only.
- [ ] `backend/.env` is ignored by Git.
- [ ] Local backend container was recreated after editing `.env`.
- [ ] Local `/api/auth/test-email` request succeeds.
- [ ] Render backend uses port `2525`.
- [ ] Render `BACKEND_URL` has no trailing slash.
- [ ] Render SMTP test succeeds.
- [ ] A real registration email arrives and verifies an account.
- [ ] `NODE_ENV` remains `development` until delivery is proven reliable.
