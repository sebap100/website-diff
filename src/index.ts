require('dotenv').config();

var webUrl = process.env.WEBSITE_URL!;

var CronJob = require('cron').CronJob;
var job = new CronJob(
  // '*/3 * * * * *', // every 3 seconds
  //'*/5 * * * *', // every 5 minutes
  process.env.CRON_EXPRESSION, // every 10 minutes
  function () {
    run(webUrl);
  },
  null,
  true,
  'Europe/Brussels'
);
// Use this if the 4th param is default value(false)
job.start()

async function fetchWebsite(url: string) {
  var fetch = require('node-fetch');
  return fetch(url).then((res: any) => res.text());
}

async function fetchWebsitePart(url: string, selectorExpr: string) {
  const fetch = require('node-fetch');
  await fetch(url).then((res: any) => res.text());

  const jsdom = require("jsdom");
  const {JSDOM} = jsdom;

  const dom = new JSDOM(await fetchWebsite(url));
  return dom.window.document.querySelector(selectorExpr)?.innerHTML;
}

function diffing(one: string, other: string) {
  require('colors');
  const Diff = require('diff');

  const diff = Diff.diffChars(one, other);

  diff.forEach((part: any) => {
    if (!part.added && !part.removed) return;

    // green for additions, red for deletions
    // grey for common parts
    const color = part.added
      ? 'green'
      : part.removed
        ? 'red'
        : 'grey';

    process.stderr.write(part.value[color]);
  });

  return diff.length === 1;
}

let websiteContent: string;

async function run(url: string) {
  if (websiteContent) {
    const newContent = await fetchWebsitePart(url, process.env.QUERY_SELECTOR_EXPRESSION!);
    const isSame = diffing(websiteContent, newContent);
    console.log(`Is same ? ${isSame}  --  ${new Date().toLocaleString()}`);

    if (!isSame) {
      sendMail();
    }

    websiteContent = newContent;
  } else {
    websiteContent = await fetchWebsitePart(url, process.env.QUERY_SELECTOR_EXPRESSION!);
  }
}

async function sendMail() {
  var nodemailer = require('nodemailer');
  const transport = nodemailer.createTransport({
    service: "Hotmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    }
  });

  var mailOptions = {
    from: process.env.SENDER_EMAIL, // sender address
    to: process.env.RECIPIENT_EMAIL, // my mail
    subject: `Tickets has arrived !`, // Subject line
    text: 'Check: ' + webUrl, // plain text body
  };

  transport.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      return console.log('Error while sending mail: ' + error);
    } else {
      console.log('Message sent: %s', info.messageId);
    }
    transport.close(); // shut down the connection pool, no more messages.
  });
}
