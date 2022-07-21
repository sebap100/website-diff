# website-diff

Triggers a diff on part of a website every defined interval of time and notify by email if the content has changed.

### Configuration
| Environment variables      | Description                                                         |
|----------------------------|---------------------------------------------------------------------|
| WEBSITE_URL                | The website URL to diff                                             |
| QUERY_SELECTOR_EXPRESSION  | A query selector expression to select a part of the website to diff |
| SENDER_EMAIL               | Email address of the sender                                         |
| SENDER_PASSWORD            | Password of the email sender                                        |
| RECIPIENT_EMAIL            | Email address of the recipient of the notification email            |
| CRON_EXPRESSION            | A cron expression defining the diff execution interval              |

### Execution

```shell
npm start
```
