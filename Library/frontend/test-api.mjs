import http from 'node:http';

let role = 'employee';
const inventory = [
  { id: 1, title: 'North Star', author: 'A. Reader', isbn: '111', category: 'Fiction', available: true, description: 'Test' },
  { id: 2, title: 'On Loan', author: 'B. Reader', isbn: '222', category: 'History', available: false, description: 'Borrowed' },
];
const loans = [1, 2, 3, 4].map(id => ({
  id,
  book_title: `Loan ${id}`,
  title: `Loan ${id}`,
  author: 'Reader',
  due_date: '2026-11-01T00:00:00',
  borrow_date: '2026-10-01T00:00:00',
  return_date: null,
}));

http.createServer((req, res) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; });
  req.on('end', () => {
    let body = {};
    try {
      body = JSON.parse(raw || '{}');
    } catch {}

    const path = new URL(req.url, 'http://localhost').pathname;
    let data = {};
    let status = 200;

    if (path === '/api/auth/login') {
      role = body.email.startsWith('admin') ? 'admin' : 'employee';
      data = {
        access_token: `${role}-token`,
        refresh_token: 'refresh-token',
        user: { id: 1, email: body.email, is_admin: role === 'admin', role },
      };
    } else if (path === '/api/auth/me') {
      role = (req.headers.authorization || '').includes('admin') ? 'admin' : role;
      data = { id: 1, email: `${role}@example.test`, is_admin: role === 'admin', role };
    } else if (path === '/api/auth/register') {
      status = 201;
      data = { message: 'registered' };
    } else if (path === '/api/auth/forgot-password') {
      data = { message: 'If this email is registered, you will receive a reset link shortly.' };
    } else if (path === '/api/auth/logout') {
      data = { message: 'logged out' };
    } else if (path === '/api/books/bookshelf' || path === '/api/books/history') {
      data = loans;
    } else if (path === '/api/books/recent') {
      data = inventory;
    } else if (path === '/api/books/search-global') {
      data = [{ ...inventory[0], in_library: true }];
    } else if (path === '/api/books/borrow') {
      data = { message: 'Book borrowed successfully' };
    } else if (path === '/api/books/return') {
      const loan = loans.find(item => item.id === body.history_id);
      if (loan) loan.return_date = '2026-10-08T00:00:00';
      data = { message: 'returned' };
    } else if (path === '/api/admin/stats') {
      data = {
        total_books: 2,
        borrowed_books: 1,
        total_users: 3,
        overdue_count: 0,
        inventory_status: [{ name: 'Available', value: 1 }, { name: 'Borrowed', value: 1 }],
        category_data: [{ name: 'Fiction', value: 1 }],
        recent_transactions: [],
      };
    } else if (path === '/api/admin/all-books') {
      data = inventory;
    } else if (path === '/api/admin/import') {
      data = { message: 'imported' };
    } else if (path.startsWith('/api/admin/books/')) {
      data = { message: req.method === 'DELETE' ? 'deleted' : 'updated' };
    } else {
      status = 404;
      data = { message: `Unhandled ${req.method} ${path}` };
    }

    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(data));
  });
}).listen(5000, '::', () => {
  console.log('Test API stub listening on port 5000');
});
