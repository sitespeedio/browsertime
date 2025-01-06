import { getLogger } from '@sitespeed.io/log';
import { until, By } from 'selenium-webdriver';
const log = getLogger('browsertime.video');
export async function setOrangeBackground(driver) {
  log.debug('Add orange color');
  // We tried other ways for Android (access an orange page)
  // That works fine ... but break scripts
  // https://github.com/sitespeedio/browsertime/issues/802
  const orangeScript = `
        (function() {
          const orange = document.createElement('div');
          orange.id = 'browsertime-orange';
          orange.style.position = 'absolute';
          orange.style.top = '0';
          orange.style.left = '0';
          orange.style.width = Math.max(document.documentElement.clientWidth, document.body.clientWidth) + 'px';
          orange.style.height = Math.max(document.documentElement.clientHeight,document.body.clientHeight) + 'px';
          orange.style.backgroundColor = '#DE640D';
          orange.style.zIndex = '2147483647';
		      orange.style.pointerEvents = 'none';
          document.body.appendChild(orange);
          document.body.style.display = '';
        })();`;

  await driver.executeScript(orangeScript);
  // It seems that in some cases the video do not have any orange at the start, so make sure we
  // the div orange div really exits
  return driver.wait(until.elementsLocated(By.id('browsertime-orange')));
}
