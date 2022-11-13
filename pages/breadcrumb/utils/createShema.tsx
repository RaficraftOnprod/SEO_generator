export function outputFormated(type: string, URL, description, offset): string {

  if (URL.decompose.length === 0) {
    return 'Type your url on the input'
  }

  const withOrder = Object.values(URL.decompose).length > 1 ? true : false;
  let output = '';

  switch (type) {

    case 'microdata':

      output +=
        `<ol itemScope itemType="https://schema.org/BreadcrumbList">
    ${htmlItem().trim()}
</ol>`

      return output.trim();

    case 'jsonLD':

      output +=
        `<script type="application/ld+json">
[{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",`

      if (withOrder) output += `\n  itemListOrder: 'ItemListOrderAscending',\n`;
      output +=
        `itemListElement:
  [{
    \t${JSON.stringify(jsonLDItem(URL, description, offset), null, '\t').slice(7, -3).trim()}
  }]
}]
</script>`
      return output;

    default:

      output = `
  const structuredData = 
[{
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',`
      if (withOrder) output += `\n  itemListOrder: 'ItemListOrderAscending',\n`;
      output +=
        `  itemListElement:
  [{
    \t${JSON.stringify(jsonLDItem(URL, description, offset), null, '\t').slice(7, -3).trim()}
  }]
}];

<script
  key="structured-data"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
`
      return output.trim();
  }

}

// Utils

export function htmlItem(URL, description) {
  let res = ''

  for (let i = 0; i < URL.decompose.length; i++) {

    if (i > 0) {

      res +=
        `   <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">`

      if (i < URL.decompose.length - 1) {
        res +=
          `<a itemProp="item" href="https://example.com/books">
        <span itemProp="name">Books</span></a>
        <meta itemProp="position" content="1" />`

      } else {
        res +=
          `<a itemProp="item" href="https://example.com/books">
        <span itemProp="name">Books</span></a>
        <meta itemProp="position" content="1" />
          `

        if (i === URL.decompose.length - 1 && description) {
          res +=
            `<meta itemProp="description" content="${description}" />`
        }
      }

      res += `\n\t</li>\n`

    }
  }
  return res;
}

export function jsonLDItem(URL, description, offset: boolean) {

  let res = []
  let obj: any = {}
  const start = offset ? 0 : 1

  for (let i = 0; i < URL.decompose.length; i++) {

    if (i >= start) {

      if (i < URL.decompose.length - 1) {
        obj = {
          "@type": "ListItem",
          "position": i,
          "name": URL.name[i].replace('.html', ''),
          "item": rebuildURL(i, URL),
        }

      } else {
        obj = {
          "@type": "ListItem",
          "position": i,
          "name": URL.name[i].replace('.html', '')
        }

        if (i === URL.decompose.length - 1 && description) {
          obj.description = description
        }
      }

      res.push(obj)
    }
  }
  return res;
}

function rebuildURL(idx: number, URL: any) {
  let res = ''
  res += URL.https ? 'https://' : 'http://';
  res += URL.www ? 'www.' : '';

  const dynamic = URL.decompose.map((url, key) => {
    if (key <= idx) {
      return url + '/';
    } else { return null }
  }).join('')

  res += dynamic;
  return res;
}