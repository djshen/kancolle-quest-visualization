const cheerio = require('cheerio')
const axios = require('axios')
const fs = require('fs')
const iconv = require('iconv-lite')
const htmlToText = require('html-to-text').fromString
const stringify = require('json-stable-stringify')

const wikiQuestUrl = 'http://wikiwiki.jp/kancolle/?%C7%A4%CC%B3';
const prefixes = ['A', 'B', 'Bd', 'Bw', 'Bm', 'Bq', 'C', 'D', 'E', 'F', 'G', 'WA', 'WB', 'WC', 'WF'];
const idPattern = RegExp('^id-(' + prefixes.join('|') + ')\\d+$');
const colNum = 10;

function html2text(html) {
  return htmlToText(html, {
    wordwrap: false,
    ignoreHref: true
  })
}

function isQuest(id, prefix) {
  if (prefix) {
    let pattern = RegExp('^id-' + prefix + '\\d+$');
    return pattern.test(id);
  }
  return idPattern.test(id);
}

function parseRequirements($node, $) {
  let ids = [];
  $node.children('a').each(function(i, el) {
    let hash = $(el).attr('href').substr(1);
    if (isQuest(hash)) {
      ids.push(hash.replace('id-', ''));
    }
  });
  return ids;
}

function sortQuests(quests) {
  const pattern = RegExp('^(' + prefixes.join('|') + ')(\\d+)$');
  function parseId(id) {
    let match = pattern.exec(id);
    if (!match) throw Error('sortQuests: Invalid id: ' + id);
    return [match[1], parseInt(match[2])]
  }
  quests.sort((q1, q2) => {
    let [prefix1, index1] = parseId(q1.id);
    let [prefix2, index2] = parseId(q2.id);

    if (prefix1 === prefix2) {
      //console.log(q1.id, q2.id, index1 - index2);
      return index1 - index2
    }

    //console.log(q1.id, q2.id, prefixes.indexOf(prefix1) - prefixes.indexOf(prefix2))
    return prefixes.indexOf(prefix1) - prefixes.indexOf(prefix2)
  });
}

function parseWikiPage(html) {
  const $ = cheerio.load(html)

  let quests = {}, rowspans = Array(colNum);

  prefixes.forEach(prefix => {
    $('a.anchor[id^="id-' + prefix + '"]').each((i, el) => {
      let $this = $(el);
      if (!isQuest($this.attr('id'), prefix)) return;

      let $row = $this.closest('tr');
      let data = Array(colNum);
      let $children = $row.children('td');
      let childIndex = 0;

      for (let i = 0; i < colNum; i++) {
        if (rowspans[i]) {
          data[i] = rowspans[i].data;
          rowspans[i].count -= 1;
          if (rowspans[i].count === 0) {
            rowspans[i] = null;
          }
        } else {
          let $child = $children.eq(childIndex);
          data[i] = $child;
          if ($child.attr('rowspan')) {
            if (rowspans[i]) {
              throw Error('invalid rowspan');
            }
            rowspans[i] = {
              count: parseInt($child.attr('rowspan')) - 1,
              data: $child
            }
          }
          childIndex++;
        }
      }

      data.forEach((item, i) => {
        if (typeof item === 'undefined') {
          console.log('gg', $row, i);
        }
      });

      let id = data[0].text().trim();

      quests[id] = {
        id: id,
        url: wikiQuestUrl + '#id-' + id,
        name: data[1].text().trim(),
        description: html2text(data[2].html()).trim(),
        fuel: data[3].text().trim(),
        ammo: data[4].text().trim(),
        steel: data[5].text().trim(),
        bauxite: data[6].text().trim(),
        bonus: html2text(data[7].html()).trim(),
        requirements: parseRequirements(data[8], $)
      };
    });
  });

  quests = Object.keys(quests).map(k => quests[k]);
  sortQuests(quests);

  return quests
}

function saveQuests(quests) {
  return fs.writeFile(
    'new-quests.json',
    stringify(quests, {space: 2}),
    err => {
      if (err) throw err;
      console.log('Quests saved');
    }
  )
}

axios({
  url: wikiQuestUrl,
  responseType: 'arraybuffer'
})
  .then(response => {
    console.log('Wiki loaded');
    let data = iconv.decode(response.data, 'EUC-JP');
    fs.writeFileSync('wiki.html', data)
    return parseWikiPage(data)
  })
  .then(saveQuests)
  .catch(error => {
    console.log(error);
  })
