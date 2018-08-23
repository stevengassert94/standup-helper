#!/usr/bin/env node
const Configstore = require('configstore');
const program = require('commander');

const callAndFilter = require('./callAndFilter');
const output = require('./output.js');
const pkg = require('../package.json');
const inquirer = require('./inquirer');
const configStore = new Configstore(pkg.name, {
  url: 'https://api.github.com',
});

program
  .version(pkg.version, '-v, --version')
  .option('--init', `Initialize ${pkg.name}`)
  .option('-i, --issues', 'Include issues')
  .option('-p, --pull-requests', 'Include pull requests')
  .option('-c, --commits', 'Include commits')
  .option('-t, --timeframe', 'The timeframe in hours')
  .option('-g, --github-url [url]', 'The GitHub URL', 'https://api.github.com')
  .option('-a, --access-token [access_token]', 'The GitHub access token')
  .parse(process.argv);

program.parse(process.argv);

if (program.init) {
  // Ask for the default parameters and save them in
  // ~/.config/configstore/standup-helper.json
  inquirer.prompt()
    .then((answers) => {
      console.log('Saving options into the configuration file');
      Object.keys(answers).forEach(k => configStore.set(k, answers[k]));
      answers.token = 'hidden';
      console.log(JSON.stringify(answers, null, 2));
    });
} else {
  const config = configStore.all;
  // if there are no options specified we will include all types of events.
  if (!program.issues && !program.pullRequests && !program.commits){
    config.issues = true;
    config.pull_requests = true;
    config.commits = true;
  } else {
    config.issues = program.issues || false;
    config.commits = program.commits || false;
    config.pull_requests = program.pullRequests || false;
  }

  async function getActivity() {
    try{
      results = await callAndFilter(config).getActivity(); 
      output.outputCli(results);
    } catch(error) {
      console.log(`there was an error attempting to getActivity(): ${error}`);
    }
  }
  getActivity();

  
}