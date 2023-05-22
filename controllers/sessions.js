const urlExists = require("url-exists");
const chalk = require('chalk');
const boxen = require('boxen');

module.exports = class Sessions {

  static session = new Array()

  static async isURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return pattern.test(str);
  }

  static async checkPath(path) {
    urlExists(path, (error, exists) => {
      if (exists) {
        return true
      }
      else {
        return false
      }
    })
  }

  static async sleep(ms) {
    let time = parseInt(ms) | 1
    return new Promise(resolve => setTimeout(resolve, time));
  }

  static async upToDate(local, remote) {
    const VPAT = /^\d+(\.\d+){0,2}$/;
    if (!local || !remote || local.length === 0 || remote.length === 0)
      return false;
    if (local == remote) return true;
    if (VPAT.test(local) && VPAT.test(remote)) {
      const lparts = local.split('.');
      while (lparts.length < 3) lparts.push('0');
      const rparts = remote.split('.');
      while (rparts.length < 3) rparts.push('0');
      for (let i = 0; i < 3; i++) {
        const l = parseInt(lparts[i], 10);
        const r = parseInt(rparts[i], 10);
        if (l === r) continue;
        return l > r;
      }
      return true;
    } else {
      return local >= remote;
    }
  }

  static async logUpdateAvailable(current, latest) {
    const newVersionLog =
      `Há uma nova versão da ${chalk.bold(`API-TJMS`)} ${chalk.gray(current)} ➜  ${chalk.bold.green(latest)}\n` +
      `Atualize sua API executando:\n\n` +
      `${chalk.bold('\>')} ${chalk.blueBright('git pull && npm install')}`;
    console.log(boxen(newVersionLog, { padding: 1 }));
    console.log(
      `Para mais informações visite: ${chalk.underline(
        'https://github.com/AlanMartines/diario-da-justica-eletronico-tjms/releases'
      )}\n`
    );
  }
}