import { Dbeditor2Page } from './app.po';

describe('dbeditor2 App', function() {
  let page: Dbeditor2Page;

  beforeEach(() => {
    page = new Dbeditor2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
