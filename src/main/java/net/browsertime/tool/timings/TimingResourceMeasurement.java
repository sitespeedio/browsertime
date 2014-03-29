/*******************************************************************************************************************************
 * It's Browser Time!
 * 
 * 
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) & Peter Hedenskog
 * (http://peterhedenskog.com)
 * 
 ******************************************************************************************************************************** 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 * 
 ******************************************************************************************************************************** 
 */
package net.browsertime.tool.timings;

import javax.xml.bind.annotation.XmlAccessOrder;
import javax.xml.bind.annotation.XmlAccessorOrder;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorOrder(XmlAccessOrder.ALPHABETICAL)
public class TimingResourceMeasurement extends TimingMark
    implements
      Comparable<TimingResourceMeasurement> {
  private final String initiatorType;
  private final double duration;
  private final double redirectStart;
  private final double redirectEnd;
  private final double fetchStart;
  private final double domainLookupStart;
  private final double domainLookupEnd;
  private final double connectStart;
  private final double connectEnd;
  private final double secureConnectionStart;
  private final double requestStart;
  private final double responseStart;
  private final double responseEnd;

  public TimingResourceMeasurement(String name, double startTime, String initiatorType,
      double duration, double redirectStart, double redirectEnd, double fetchStart,
      double domainLookupStart, double domainLookupEnd, double connectStart, double connectEnd,
      double secureConnectionStart, double requestStart, double responseStart, double responseEnd) {
    super(name, startTime);
    this.initiatorType = initiatorType;
    this.duration = duration;
    this.redirectStart = redirectStart;
    this.redirectEnd = redirectEnd;
    this.fetchStart = fetchStart;
    this.domainLookupStart = domainLookupStart;
    this.domainLookupEnd = domainLookupEnd;
    this.connectStart = connectStart;
    this.connectEnd = connectEnd;
    this.secureConnectionStart = secureConnectionStart;
    this.requestStart = requestStart;
    this.responseStart = responseStart;
    this.responseEnd = responseEnd;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(NonScientificDoubleAdapter.class)
  public Double getDuration() {
    return duration;
  }

  @XmlAttribute
  public String getInitiatorType() {
    return initiatorType;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getRedirectStart() {
    return redirectStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getRedirectEnd() {
    return redirectEnd;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(NonScientificDoubleAdapter.class)
  public Double getFetchStart() {
    return fetchStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getDomainLookupStart() {
    return domainLookupStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getDomainLookupEnd() {
    return domainLookupEnd;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getConnectStart() {
    return connectStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getConnectEnd() {
    return connectEnd;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getSecureConnectionStart() {
    return secureConnectionStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getRequestStart() {
    return requestStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(OptionalNonScientificDoubleAdapter.class)
  public Double getResponseStart() {
    return responseStart;
  }

  @XmlAttribute
  @XmlJavaTypeAdapter(NonScientificDoubleAdapter.class)
  public Double getResponseEnd() {
    return responseEnd;
  }

  private Double getEndTime() {
    return getStartTime() + getDuration();
  }

  @SuppressWarnings("UnusedDeclaration")
  private TimingResourceMeasurement() {
    super(null, 0);
    initiatorType = null;
    duration = 0;
    redirectStart = 0;
    redirectEnd = 0;
    fetchStart = 0;
    domainLookupStart = 0;
    domainLookupEnd = 0;
    connectStart = 0;
    connectEnd = 0;
    secureConnectionStart = 0;
    requestStart = 0;
    responseStart = 0;
    responseEnd = 0;
  }

  @Override
  public int compareTo(TimingResourceMeasurement o) {
    return (int) (getEndTime() - o.getEndTime());
  }
}
