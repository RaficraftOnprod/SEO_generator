import { useContext } from 'react'
import { UI_context, UI_context_type } from '../../../context/UI_Provider'
import S from './Breadcrumb.module.scss'

export default function BreadCrumb({ structuredData }: any): JSX.Element {

  const { UI } = useContext(UI_context) as UI_context_type;


  return (
    <nav className={S.breadcrumb}>
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className={S.content}
      >
        <li itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <a itemProp="item" href="https://example.com/">
            <span itemProp="name">{'Home'}</span>
          </a>
          <meta itemProp="position" content="0" />
        </li>
        {UI.breadcrumb.length > 0
          &&
          (UI.breadcrumb.map(
            (element: any, idx: number) => {
              return (
                <li key={idx}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <a itemProp="item" href={element.item}>
                    <span >
                      {element.name}
                    </span>
                    {element.description ?
                      <meta itemProp="description" content={element.description} />
                      : null
                    }
                  </a>
                </li>
              )
            })
          )
        }
      </ol>
    </nav>
  )
}