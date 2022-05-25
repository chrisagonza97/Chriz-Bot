import styles from './HeaderNav.module.scss';
import Link from 'next/link';
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';

export const HeaderNav = () => {
  return (
    <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
      <Container>
        <Link href='/'>
          <Navbar.Brand href='#home'>
            <span className={styles.logo}>
              <img
                className='d-inline-block align-top'
                alt='Stonks '
                src='/images/stonks.jpg'
              ></img>{' '}
            </span>
            Stonks
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='me-auto'>
            <Nav.Link href='/'>Paper Stonks</Nav.Link>
            <Nav.Link href='/commands'>Commands</Nav.Link>
            {/*<NavDropdown title='Dropdown' id='collasible-nav-dropdown'>
              <NavDropdown.Item href='#action/3.1'>Action</NavDropdown.Item>
              <NavDropdown.Item href='#action/3.2'>
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href='#action/3.3'>Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href='#action/3.4'>
                Separated link
              </NavDropdown.Item>
  </NavDropdown>*/}
          </Nav>
          <Nav>
            <Button
              onClick={() =>
                window.open('http://localhost:4000/auth/discord', '_self')
              }
            >
              Add To Server
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
