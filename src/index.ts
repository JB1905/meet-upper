#!/usr/bin/env node

import path from 'path';
import program from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import fetch from 'node-fetch';

const pkg = require(path.join(__dirname, '../package.json'));

program.version(pkg.version).description(chalk.blue('meetUPPER'));

program
  .command('UPCOMING <group>')
  .description('Show upcoming meetups')
  .action(async (group: string) => {
    try {
      const res = await fetch(`https://api.meetup.com/${group}/events`);

      const meetups = await res.json();

      if (meetups?.errors?.[0]?.code === 'group_error') {
        console.log(meetups.errors[0].message);

        process.exit(1);
      }

      if (!meetups.length) {
        console.log('Not found upcoming events 😞');

        process.exit(1);
      }

      meetups.map((meetup: { [key: string]: string }) => {
        const { name, link, time } = meetup;

        const date = new Date(time);

        const convertTime = (time: number) => (time < 10 ? `0${time}` : time);

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
      console.error(chalk.red(err.message));
    }
  });

program.on('command:*', () => {
  console.error(chalk.red('Invalid command'));

  process.exit(1);
});

program.on('--help', () => {
  console.log(
    chalk.red(figlet.textSync('meetUPPER', { horizontalLayout: 'full' }))
  );
});

program.parse(process.argv);
