import { describe, expect, test } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockApi, requestedUrls } from './test/fakeApi';

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  );
}

const resultList = () => screen.findByRole('list');

describe('browse', () => {
  test('lists all films with year, title, date, genres and budget', async () => {
    mockApi();
    renderAt('/');
    const list = await resultList();
    expect(within(list).getByRole('link', { name: 'Movie 1' })).toBeInTheDocument();
    expect(within(list).getByText('1995-01-01')).toBeInTheDocument();
    expect(within(list).getByText(/\$4,000,000/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'All films' })).toBeInTheDocument();
    expect(screen.getByText('100 films, page 1 of 2')).toBeInTheDocument();
  });

  test('paginates with the page query param', async () => {
    const fetchMock = mockApi();
    renderAt('/');
    await userEvent.click(await screen.findByRole('link', { name: 'Next page' }));
    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument();
    expect(requestedUrls(fetchMock)).toContain('/api/v1/movies?page=2');
  });

  test('picks a year by decade and changes sort order', async () => {
    const fetchMock = mockApi();
    renderAt('/?by=year');
    expect(screen.getByText('Pick a decade, then a year.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '1950s' }));
    await userEvent.click(screen.getByRole('button', { name: '1955' }));
    expect(await screen.findByRole('heading', { name: 'Films from 1955' })).toBeInTheDocument();
    await resultList();

    await userEvent.click(screen.getByRole('button', { name: 'Newest first' }));
    await waitFor(() =>
      expect(requestedUrls(fetchMock)).toEqual(
        expect.arrayContaining([
          '/api/v1/years/1955/movies?page=1&order=asc',
          '/api/v1/years/1955/movies?page=1&order=desc',
        ]),
      ),
    );
    expect(screen.getByRole('button', { name: 'Newest first' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('filters by genre', async () => {
    const fetchMock = mockApi();
    renderAt('/?by=genre');
    await userEvent.click(await screen.findByRole('button', { name: 'Action' }));
    await resultList();
    expect(requestedUrls(fetchMock)).toContain('/api/v1/genres/Action/movies?page=1');
    expect(screen.getByRole('heading', { name: 'Action' })).toBeInTheDocument();
  });

  test('shows API validation errors', async () => {
    mockApi();
    renderAt('/?by=year&year=95');
    expect(await screen.findByRole('alert')).toHaveTextContent('four-digit year');
  });
});

describe('search', () => {
  test('searches titles as you type', async () => {
    const fetchMock = mockApi();
    renderAt('/');
    await resultList();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search films by title' }), 'wars');

    expect(await screen.findByRole('heading', { name: 'Titles matching “wars”' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Star wars' })).toBeInTheDocument();
    expect(requestedUrls(fetchMock)).toContain('/api/v1/movies?q=wars&page=1');
  });

  test('loads search results from the URL and clears with Escape', async () => {
    mockApi();
    renderAt('/?q=alien');
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('alien');
    expect(await screen.findByRole('link', { name: 'Star alien' })).toBeInTheDocument();

    await userEvent.type(input, '{Escape}');
    expect(input).toHaveValue('');
    expect(await screen.findByRole('heading', { name: 'All films' })).toBeInTheDocument();
  });

  test('focuses search with the / key', async () => {
    mockApi();
    renderAt('/');
    await resultList();
    await userEvent.keyboard('/');
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  test('explains when nothing matches', async () => {
    mockApi();
    renderAt('/?q=zzz');
    expect(await screen.findByText(/No titles match/)).toBeInTheDocument();
  });
});

describe('movie details', () => {
  test('opens in the side panel from the list', async () => {
    mockApi();
    renderAt('/');
    await userEvent.click(await screen.findByRole('link', { name: 'Movie 1' }));
    const panel = await screen.findByRole('complementary', { name: 'Film details' });
    expect(await within(panel).findByRole('img', { name: 'Rated 3.27 out of 5 from 56 ratings' })).toBeInTheDocument();
    expect(within(panel).getByText('Miramax Films')).toBeInTheDocument();
    expect(within(panel).getByText('French')).toBeInTheDocument();
    expect(within(panel).getByText('1 h 38 min')).toBeInTheDocument();

    await userEvent.click(within(panel).getByRole('button', { name: 'Close film details' }));
    expect(within(panel).queryByRole('article')).not.toBeInTheDocument();
  });

  test('has a standalone page', async () => {
    mockApi();
    renderAt('/movies/tt0000001');
    expect(await screen.findByRole('heading', { level: 1, name: 'Movie 1' })).toBeInTheDocument();
    expect(screen.getByText('A film.')).toBeInTheDocument();
  });

  test('shows not found for unknown movies', async () => {
    mockApi();
    renderAt('/movies/tt404');
    expect(await screen.findByRole('alert')).toHaveTextContent('Movie not found');
  });
});
