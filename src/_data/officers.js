// ==========================================================================
// Officer team
// --------------------------------------------------------------------------
// Reads src/content/about-officer-team.txt and hands the About page a list
// it can loop over. To change who is on the team, edit that .txt file, not
// this one.
// ==========================================================================

const { blocks } = require("../../lib/content.js");

// Exported as a function, not a value, because Eleventy calls it again on
// every build. That is what makes `npm run dev` pick up an edit to the .txt
// file while you are watching the page.
module.exports = () =>
  blocks("about-officer-team.txt").map((lines) => {
    const rest = lines.slice(2).map((line) => line.trim());

    const photoLine = rest.find((line) => /^photo:/i.test(line));

    return {
      role: lines[0].trim(),
      name: lines[1].trim(),
      // Major, year, and anything else listed under the name.
      details: rest.filter(
        (line) => !line.includes("@") && !/^photo:/i.test(line)
      ),
      // Optional: any line with an @ in it is treated as an email address.
      email: rest.find((line) => line.includes("@")) || "",
      // Optional: a line like "Photo: /assets/officers/ify.jpg" shows a
      // portrait above the name. Without one, a "Portrait coming soon" slot
      // holds the space.
      photo: photoLine ? photoLine.replace(/^photo:\s*/i, "") : "",
    };
  });
