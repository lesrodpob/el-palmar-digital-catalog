import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { products } from './products';
import './styles.css';
import logo from './images/logo.jpeg';

const WHATSAPP = '2368802463';

const money = n =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(n || 0);

function App() {
  const [category, setCategory] = useState('TODOS');
  const [family, setFamily] = useState('TODAS');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const normalizeCategory = value =>
    String(value || '').replace(/\s+/g, ' ').trim().toUpperCase();
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const families = useMemo(() => {
    const p =
      category === 'TODOS'
        ? products
        : products.filter(x => x.category === category);

    return [
      ...new Set(
        p.map(x => x.family).filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b));
  }, [category]);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    const selectedCategory = normalizeCategory(category);

    return products.filter(p =>
      (selectedCategory === 'TODOS' ||
        normalizeCategory(p.category) === selectedCategory) &&
      (family === 'TODAS' || p.family === family) &&
      (!onlyAvailable || p.available) &&
      (!q ||
        `${p.name} ${p.brand || ''} ${p.family} ${p.category}`
          .toLowerCase()
          .includes(q))
    );
  }, [category, family, query, onlyAvailable]);

  // Agregar producto
  const add = p => {
    if (!p.available) return;

    setCart(currentCart => {
      const existing = currentCart.find(item => item.id === p.id);

      if (existing) {
        return currentCart.map(item =>
          item.id === p.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: p.id,
          quantity: 1
        }
      ];
    });
  };

  // Aumentar cantidad
  const increase = id => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Disminuir cantidad
  const decrease = id => {
    setCart(currentCart =>
      currentCart
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // Productos seleccionados
  const selected = cart
    .map(item => {
      const product = products.find(p => p.id === item.id);

      return product
        ? {
          ...product,
          quantity: item.quantity
        }
        : null;
    })
    .filter(Boolean);

  // Total de unidades
  const totalUnits = selected.reduce(
    (total, product) => total + product.quantity,
    0
  );

  // Enviar pedido por WhatsApp
  const order = () => {
    if (!selected.length) return;

    const lines = selected
      .map(
        p =>
          `• ${p.name} x${p.quantity} — ${money(
            p.price
          )}`
      )
      .join('%0A');

    const text =
      `Hola Distribuidora El Palmar 👋` +
      `Quiero consultar por estos productos:%0A` +
      `${lines}%0A%0A` +
      `¿Me pueden confirmar disponibilidad y forma de entrega?`;

    window.open(
      `https://wa.me/${WHATSAPP}?text=${text}`,
      '_blank'
    );
  };

  return (
    <div className="app">

      <header className="hero">
        <div className="hero-inner">

          <img
            src={logo}
            className="logo"
            alt="Distribuidora El Palmar"
          />

          <div className="hero-copy">
            <span className="eyebrow">
              CATÁLOGO DE PRODUCTOS
            </span>

            <h1>Vinos & Licores</h1>

            <p>
              Encuentra tus productos y cotiza con nosotros! Envianos tu pedido por WhatsApp.
            </p>
          </div>

          <button
            className="order-pill"
            onClick={order}
            disabled={!selected.length}
          >
            🛒 Pedido{' '}
            {totalUnits ? `(${totalUnits})` : ''}
          </button>

        </div>
      </header>

      <main>

        <section className="toolbar">

          <div className="search">
            <span>⌕</span>

            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar producto..."
            />
          </div>

          <label className="availability">

            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={e =>
                setOnlyAvailable(e.target.checked)
              }
            />

            Solo disponibles

          </label>

        </section>

        <section className="categories">

          {['TODOS', 'VINOS', 'LICORES', 'BEBIDAS NO ALCOHOLICAS'].map(c => (
            <button
              key={c}
              className={
                category === c ? 'active' : ''
              }
              onClick={() => {
                setCategory(c);
                setFamily('TODAS');
              }}
            >
              {c}
            </button>
          ))}

        </section>

        <section className="family-row">

          <select
            value={family}
            onChange={e =>
              setFamily(e.target.value)
            }
          >
            <option value="TODAS">
              Todas las familias
            </option>

            {families.map(f => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <span>
            {visible.length} productos
          </span>

        </section>

        <section className="grid">

          {visible.map(p => {

            const cartItem = cart.find(
              item => item.id === p.id
            );

            const quantity =
              cartItem?.quantity || 0;

            return (
              <article
                className="card"
                key={p.id}
              >

                <div className={`product-art ${p.category.toLowerCase()}`}>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="product-image"
                    />
                  ) : (
                    <span>
                      {p.category === 'VINOS' ? '🍷' : '🥃'}
                    </span>
                  )}

                  <small>{p.family}</small>
                </div>

                <div className="card-body">

                  <span className="tag">
                    {p.category}
                  </span>

                  <h2>{p.name}</h2>

                  <div className="price">
                    {money(p.price)}
                  </div>

                  <div
                    className={
                      p.available
                        ? 'stock in'
                        : 'stock out'
                    }
                  >
                    {p.available
                      ? '● Disponible'
                      : '● Sin stock'}
                  </div>

                  {quantity === 0 ? (

                    <button
                      className="add"
                      disabled={!p.available}
                      onClick={() => add(p)}
                    >
                      {p.available
                        ? 'Agregar al pedido'
                        : 'Sin stock'}
                    </button>

                  ) : (

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          decrease(p.id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          increase(p.id)
                        }
                      >
                        +
                      </button>

                    </div>

                  )}

                </div>

              </article>
            );
          })}

        </section>

        {!visible.length && (
          <div className="empty">
            No encontramos productos con esos filtros.
          </div>
        )}

      </main>

      {selected.length > 0 && (

        <div className="floating">

          <div>
            <strong>
              {totalUnits} producto(s)
            </strong>

            <span>
              Listos para consultar
            </span>
          </div>

          <button onClick={order}>
            Pedir por WhatsApp
          </button>

          <button
            className="clear"
            onClick={() => setCart([])}
          >
            Limpiar
          </button>

        </div>

      )}

      <footer>
        Distribuidora El Palmar · Limache
      </footer>

    </div>
  );
}

createRoot(
  document.getElementById('root')
).render(<App />);