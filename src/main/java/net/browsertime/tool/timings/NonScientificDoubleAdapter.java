package net.browsertime.tool.timings;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import javax.xml.bind.annotation.adapters.XmlAdapter;

public class NonScientificDoubleAdapter extends XmlAdapter<String, Double> {
  private final DecimalFormat format = new DecimalFormat("#.######", new DecimalFormatSymbols() {
    {
      setDecimalSeparator('.');
    }
  });

  @Override
  public Double unmarshal(String v) throws Exception {
    return Double.valueOf(v);
  }

  @Override
  public String marshal(Double v) throws Exception {
    return format.format(v);
  }
}
