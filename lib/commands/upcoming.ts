import program from 'commander';
import fetch from 'node-fetch';
import chalk from 'chalk';

import { spinner } from '../functions/spinner';

program
  .command('UPCOMING <group>')
  .description('display upcoming events for a group')
  .action(async (group: string) => {
    spinner.text = 'Looking for upcoming events';
    spinner.color = 'red';
    spinner.start();

    try {
      const res = await fetch(`https://api.meetup.com/${group}/events`);

      const meetups = await res.json();

      if (meetups?.errors?.[0]?.code === 'group_error') {
        spinner.fail(meetups.errors[0].message);

        process.exit(1);
      }

      if (!meetups.length) {
        spinner.fail('Not found upcoming events 😞');

        process.exit(1);
      }

      spinner.succeed(`Found ${meetups.length} events\n`);

      meetups.map((meetup: { [key: string]: string }, index: number) => {
        const { name, link, time } = meetup;

        const date = new Date(time);

        const convertTime = (time: number) => (time < 10 ? `0${time}` : time);

        if (index !== 0) console.log('');

        console.log(
          `${chalk.bgBlue(name)}\n` +
            `\t${chalk.magenta('URL:')} ${link}\n` +
            `\t${chalk.magenta('When:')} ${convertTime(
              date.getDate()
            )}.${convertTime(
              date.getMonth() + 1
            )}.${date.getFullYear()}, ${convertTime(
              date.getHours()
            )}:${convertTime(date.getMinutes())}`
        );
      });
    } catch (err) {
      spinner.fail(chalk.red(err.message));

      process.exit(1);
    }
  });
