import {Dropdown} from 'react-bootstrap';
import {Link, useMatch} from 'react-router-dom';


export const MainDropdown = ({variant, text, onSelect, children}) => (
  <div className={`main-dropdown ${variant && `main-dropdown--${variant}`}`}>
    <Dropdown className="main-dropdown__wrap" onSelect={onSelect}>
      <Dropdown.Toggle as="button" className="btn" type="button">
        <span className="text-el">{text}</span>
        <span className="dropdown-toggle__arrow-start"></span>
        <span className="dropdown-toggle__arrow-end"></span>
        <span className="dropdown-toggle__clip"></span>
      </Dropdown.Toggle>
      <Dropdown.Menu as="ul">{children}</Dropdown.Menu>
    </Dropdown>
  </div>
);

MainDropdown.Item = ({text, active, ...rest}) => (
  <li>
    <Dropdown.Item
        className={active && 'dropdown-item--active'}
        {...rest}
    >
      {text}
    </Dropdown.Item>
  </li>
);


export const MenuDropdown = ({text, children}) => (
  <div className="menu-dropdown">
    <Dropdown className="menu-dropdown__wrap">
      <Dropdown.Toggle as="button" className="btn" type="button">
        <span className="text-el">{text}</span>
        <span className="dropdown-toggle__clip"></span>
      </Dropdown.Toggle>
      <Dropdown.Menu as="ul">{children}</Dropdown.Menu>
    </Dropdown>
  </div>
);

const MenuItem = ({text, target}) => {
  const match = useMatch(target);
  return (
    <li>
      <Dropdown.Item
          as={Link}
          to={target}
          className={match && 'dropdown-item--active'}
      >
        <span className="text-el">{text}</span>
      </Dropdown.Item>
    </li>
  );
};

MenuDropdown.Item = MenuItem;
