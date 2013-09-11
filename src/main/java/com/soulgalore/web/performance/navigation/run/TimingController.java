 /*******************************************************************************************************************************
 * It's Browser Time!
 * 
 *
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) &  Peter Hedenskog (http://peterhedenskog.com)
 *
 ********************************************************************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 ********************************************************************************************************************************
 */
package com.soulgalore.web.performance.navigation.run;

import com.google.inject.Inject;
import com.soulgalore.web.performance.navigation.TimingRunner;
import com.soulgalore.web.performance.navigation.serializer.Serializer;
import com.soulgalore.web.performance.navigation.timings.TimingSession;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class TimingController
{
    @Inject
    private TimingRunner runner;

    public void performTiming(String urlString, int numIterations, Serializer serializer) {

        try {
            URL url = new URL(urlString);
            TimingSession session = runner.run(url, numIterations);
            serializer.serialize(session);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
