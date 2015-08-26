require('dts-generator').generate({
  name: 'phosphor-widget',
  main: 'phosphor-widget/index',
  baseDir: 'lib',
  files: ['index.d.ts'],
  out: 'lib/phosphor-widget.d.ts',
});
