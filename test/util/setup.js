import intel from 'intel';
const { basicConfig, ERROR } = intel;
basicConfig({
  level: ERROR,
  format: '[%(date)s][%(levelname)s] %(message)s'
});
