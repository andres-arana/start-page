# Backlog

Things to look at after the caching work is done.

## Tridactyl alternatives
- Tridactyl owns the new tab (`set newtab` in `~/.tridactylrc`), adding an extension-page hop before this page loads.
- Evaluate alternatives: own minimal WebExtension that bundles the page and overrides the new tab (conflicts with Tridactyl's override; updates ship as extension releases instead of `git push`), or another vim-keys extension that doesn't hijack the new tab.
