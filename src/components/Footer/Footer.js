import React from 'react'
import Layout from 'antd/lib/layout'

const styles = {
  root: {
    backgroundColor: '#24292e',
    color: 'rgba(255,255,255,.7)'
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px'
  },
  inner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: '0 auto'
  },
  link: {
    color: 'rgba(255,255,255,.7)',
    textDecoration: 'none'
  },
  listItem: {
    listStyleType: 'none',
    marginBottom: '0.6em'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    margin: 0,
    minWidth: '160px'
  }
}

const left = [
  { text: 'Login', link: '/login' },
  { text: 'Checkout', link: '/order' },
  { text: 'Account', link: '/account' }
]

const right = [
  { text: 'Terms and Conditions', link: '/terms' },
  { text: 'Privacy Policy', link: '/privacy-policy' },
  { text: 'Cookie Policy', link: '/cookie-policy' },
  { text: 'Disclaimer', link: '/disclaimer' }
]

class Footer extends React.Component {
  render () {
    return (
      <Layout.Footer style={styles.root}>
        <div style={styles.footer}>
          <div style={styles.inner}>
            <ul className={styles.column}>
              {left.map(item =>
                (<li
                  style={styles.listItem}
                  key={`li_${item.link}`}
                >
                  <a
                    key={`link_${item.link}`}
                    href={item.link}
                    style={styles.link}
                  >
                    {item.text}
                  </a>
                </li>)
              )}
            </ul>
            <ul style={styles.column}>
              {right.map(item =>
                (<li
                  style={styles.listItem}
                  key={`li_${item.link}`}
                >
                  <a
                    key={`link_${item.link}`}
                    href={item.link}
                    style={styles.link}
                  >
                    {item.text}
                  </a>
                </li>)
              )}
            </ul>
          </div>
          <div />
        </div>
      </Layout.Footer>
    )
  }
}

export default Footer
