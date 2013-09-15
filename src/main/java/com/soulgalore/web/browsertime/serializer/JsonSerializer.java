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
package com.soulgalore.web.browsertime.serializer;

import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.soulgalore.web.browsertime.timings.TimingSession;

import java.io.IOException;
import java.io.Writer;

/**
 *
 */
public class JsonSerializer implements Serializer {
    private final Writer writer;

    @Inject
    public JsonSerializer(@Assisted Writer writer) {
        this.writer = writer;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        Gson gson = new Gson();
        gson.toJson(session, writer);
        writer.close();
    }
}
