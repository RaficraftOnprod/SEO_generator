import { useEffect, useRef, useState, createRef, useContext } from "react";
import ReactDOMServer from 'react-dom/server';
import S from './Breadcrumb.module.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { debounce } from '../../src/utils/debounce';
import { UI_context, UI_context_type } from "../../src/context/UI_Provider";

import { IconeClipboard } from "../../src/assets/svg/icones";

type URLTypes = {
  https: boolean,
  www: boolean,
  path: string,
  decompose: string[]
}

export default function BreadCrumb(): JSX.Element {

  const regexURL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
  const { dispatch } = useContext(UI_context) as UI_context_type
  const [URL, setURL] = useState<URLTypes>({
    https: false,
    www: false,
    path: '',
    decompose: []
  });

  const [description, setDescription] = useState<string | false>(false)
  const [format, setFormat] = useState('javascript');
  const [breadcrumbResult, setBreadcrumbResult] = useState<any>({
    jsonLD: 'Type your url on the input',
    javascript: 'Type your url on the input',
    microdata: 'Type your url on the input'
  })
  const [domainName, setDomainName] = useState<boolean>(false);

  const inputURL = useRef(null)
  const clipboardRef = useRef<HTMLTextAreaElement>(null)
  const [inputs, setInputs] = useState<any>(false)

  let inputRef = useRef<any>([]);
  let inputDescription = useRef<any>([])

  //Handler

  function checkURL() {

    if (inputURL.current) {
      const input: HTMLInputElement = inputURL.current;
      const path = input.value;

      if (regexURL.test(path)) {

        const decomposeURL = path
          .replace(/http:\/\//, '')
          .replace(/https:\/\//, '')
          .replace('www.', '')
          .split('/')
          .map(el => {
            const clean = el.split('?');
            return clean[0]
          });
        setURL({
          https: path.includes('https'),
          www: path.includes('www'),
          path: path,
          decompose: decomposeURL
        })


      } else {
        setURL({
          https: false,
          www: false,
          path: '',
          decompose: []
        })
      }
    }
  }

  function editName(idx: number) {
    setURL((state) => {
      return {
        ...state,
        decompose: { ...state.decompose, [idx]: inputRef.current[idx].value }
      }
    })
  }

  function editDescription() {
    setDescription(inputDescription.current.value)
  }

  function dynamicInputs() {

    const start = domainName ? 0 : 1

    const dynamic = URL.decompose.map((el: string, idx: number) => {

      const pageInput =
        <div
          className={`bloc_input bloc_input_col`}
          key={`dynamic-input-${idx}`}
        >
          <label>Link {idx}:</label>
          <input
            type="text"
            defaultValue={el.replace('.html', '')}
            onKeyUp={debounce(() => { editName(idx) }, 300)}
            ref={(elem) => inputRef.current[idx] = elem}

          />
        </div>

      if (idx === URL.decompose.length - 1) {
        return (
          <div key={`nested-input-${idx}`} >
            {pageInput}
            <div
              className={`bloc_input bloc_input_col bloc_input_nested`}
              key={`description-${idx}`}
            >
              <label>Page description:</label>
              <input
                type="text"
                placeholder="Enter a description of the page (optionnal)"
                defaultValue=""
                onKeyUp={debounce(() => { editDescription() }, 300)}
                ref={(elem) => inputDescription.current = elem}
              />
            </div>
          </div>)
      }
      if (idx >= start && idx < URL.decompose.length - 1) {
        return pageInput
      } else {
        return []
      }

    });
    setInputs(dynamic)
  }

  // Traitements


  function outputFormated(type: string): string {

    if (URL.decompose.length === 0) {
      return 'Type your url on the input'
    }

    const withOrder = Object.values(URL.decompose).length > 2 || domainName ? true : false;
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
    \t${JSON.stringify(jsonLDItem(domainName), null, '\t').slice(7, -3).trim()}
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
    \t${JSON.stringify(jsonLDItem(domainName), null, '\t').slice(7, -3).trim()}
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

  function htmlItem() {
    let res = ''
    const start = domainName ? 0 : 1
    for (let i = start; i < URL.decompose.length; i++) {



      res +=
        `   <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">`

      if (i < URL.decompose.length - 1) {
        res +=
          `<a itemProp="item" href="${rebuildURL(i)}">
      <span itemProp="name">${URL.decompose[i]}</span></a>
      <meta itemProp="position" content="${i + 1}" />`

      } else {
        res +=
          `<a itemProp="item" href="${rebuildURL(i)}">
      <span itemProp="name">${URL.decompose[i]}</span></a>
      <meta itemProp="position" content="${i + 1}" />
        `

        if (i === URL.decompose.length - 1 && description) {
          res +=
            `<meta itemProp="description" content="${description}" />`
        }
      }
      res += `\n\t</li>\n`
    }
    return res;
  }

  function jsonLDItem(offset: boolean) {

    let res = []
    let obj: any = {}
    const start = offset ? 0 : 1

    for (let i = 0; i < URL.decompose.length; i++) {

      if (i >= start) {

        if (i < URL.decompose.length - 1) {
          obj = {
            "@type": "ListItem",
            "position": i,
            "name": URL.decompose[i].replace('.html', ''),
            "item": rebuildURL(i),
          }

        } else {
          obj = {
            "@type": "ListItem",
            "position": i,
            "name": URL.decompose[i].replace('.html', '')
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

  function rebuildURL(idx: number) {
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

  async function copyToClipboard() {
    if (clipboardRef.current) {

      const text = clipboardRef.current.value
      console.log(text);

      if (!navigator?.clipboard) {
        console.warn('Clipboard not supported')
        return false
      }

      // Try to save to clipboard then save it in the state if worked
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        console.warn('Copy failed', error)
        return false
      }
    }
  }

  useEffect(() => {
    setInputs(false)
    setDescription(false)
    setBreadcrumbResult(
      {
        jsonLD: 'Type your url on the input',
        javascript: 'Type your url on the input',
        microdata: 'Type your url on the input'
      }
    )
    dispatch.breadcrumb(jsonLDItem(domainName))
  }, [URL, domainName])

  useEffect(() => {
    if (URL.path) {
      dynamicInputs();

      switch (format) {
        case 'jsonLD':
          setBreadcrumbResult({
            jsonLD: outputFormated('jsonLD'),
            javascript: '',
            microdata: ''
          })
          break;
        case 'javascript':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: outputFormated('javascript'),
            microdata: ''
          })
          break;
        case 'microdata':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: '',
            microdata: outputFormated('microdata'),
          })
          break;
      }
    }
  }, [URL, format, description, domainName]);


  return (
    <section className={`main_content ${S.container}`}>
      <header>

        <div className={`bloc_input full_width`}>
          <input
            type="text"
            placeholder="Type your URL"
            onKeyUp={debounce(() => {
              checkURL()
            }, 300)}
            ref={inputURL}
            defaultValue=""
          />
        </div>
        {URL.path ? (
          <div className={`${S.header_options} full_width`}>
            <div className={S.format}>
              <div className={`bloc_input`}>
                <label htmlFor="javascript">Javascript :</label>
                <input
                  type="radio"
                  id="javascript"
                  name="format"
                  defaultValue="javascript"
                  onClick={() => { setFormat('javascript') }}
                  checked={format === 'javascript'}
                />
              </div>

              <div className={`bloc_input`}>
                <label htmlFor="jsonLD">JsonLD :</label>
                <input
                  type="radio"
                  id="jsonLD"
                  name="format"
                  defaultValue="jsonLD"
                  onClick={() => { setFormat('jsonLD') }}
                  checked={format === 'jsonLD'}
                />
              </div>

              <div className={`bloc_input`}>
                <label htmlFor="microdata">Microdata :</label>
                <input
                  type="radio"
                  id="microdata"
                  name="format"
                  defaultValue="microdata"
                  onClick={() => { setFormat('microdata') }}
                  checked={format === 'microdata'}
                />
              </div>
            </div>
            <div className={`bloc_input`}>
              <label>Include domain name :</label>
              <input
                type="checkbox"
                onClick={() => setDomainName(!domainName)}
              />
            </div>

          </div>
        ) : null}


      </header>

      <div className={S.content}>
        <div className={S.seo_result}>
          <button type="button" className={S.clipboard} onClick={(() => copyToClipboard())}>
            <IconeClipboard />
          </button>

          <textarea hidden value={breadcrumbResult[format]} ref={clipboardRef}></textarea>
          <SyntaxHighlighter
            language={format === 'microdata' ? 'html' : 'javascript'}
            style={atomDark}
            wrapLongLines={true}
          >
            {breadcrumbResult[format]}
          </SyntaxHighlighter>
        </div>

        {URL.path && inputs ?
          (<details open>
            <summary>Name of links</summary>
            <div className="full_width">
              {inputs}
            </div>
          </details>)
          : null
        }

      </div>

    </section >
  )
}



