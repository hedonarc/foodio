import { useSearchStore } from './search.store';

const remember = (term: string) => useSearchStore.getState().remember(term);
const recents = () => useSearchStore.getState().recents;

beforeEach(() => useSearchStore.setState({ recents: [] }));

describe('recent searches', () => {
  it('puts the newest first', () => {
    remember('sushi');
    remember('biryani');

    expect(recents()).toEqual(['biryani', 'sushi']);
  });

  it('moves a repeat to the front rather than listing it twice', () => {
    remember('sushi');
    remember('coffee');
    remember('Sushi');

    expect(recents()).toEqual(['Sushi', 'coffee']);
  });

  it('keeps five and forgets the rest', () => {
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(remember);

    expect(recents()).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  it('ignores blank', () => {
    remember('   ');

    expect(recents()).toEqual([]);
  });
});
