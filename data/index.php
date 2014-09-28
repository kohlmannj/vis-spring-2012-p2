<?php

/** 
 * @param  $xml 
 * @param  $xsl 
 * @return string xml 
 */ 

function transform($xmlFilename, $xslFilename) { 
   $xslt = new XSLTProcessor(); 
   $xslt->importStylesheet( new SimpleXMLElement( file_get_contents($xslFilename) ) );
   return $xslt->transformToXml( new SimpleXMLElement( file_get_contents($xmlFilename) ) );
}

// Sane defaults
$xml = NULL;
$xsl = NULL;

// Shorthand
$src = $_GET["src"];
$by = $_GET["by"];
$as = $_GET["as"];
$raw = $_GET["raw"];

switch($src) {
    case "kml":
        $xml = "madison_neighborhoods_14613.kml";
        // $xsl = "locations_kml.xsl";
        break;
    case "locations":
        $xml = "locations.xml";
        $xsl = NULL;
        $raw = true;
        if ($by == "taxonomy") {
            $xsl = "locations_taxonomy.xsl";
            $raw = NULL;
        } else if ($by == "kml") {
            $xsl = "locations_kml.xsl";
            $raw = NULL;
        }
        break;
    case "topics":
        $xml = "topics.xml";
        $xsl = NULL;
        $raw = true;
        if ($by == "rank") {
            $xsl = "topics_rank.xsl";
            $raw = NULL;
        }
        break;
    case "stories":
    default:
        $xml = "stories.xml";
        $xsl = "stories.xsl";
        if ($by == "rank") {
            $xsl = "stories_rank.xsl";
        } else if ($by == "location" && $as == "json") {
            $xml = "locations.xml";
            $xsl = "locations_stories_json.xsl";
        } else if ($by == "location") {
            $xml = "locations.xml";
            $xsl = "stories_location.xsl";
        }
        break;
}

if ($xml == NULL) {
    return;
} else if ($raw != NULL) {
    header("Content-type:application/xml");
    // If requested, serve the raw XML file.
    echo file_get_contents($xml);
} else if ($raw == NULL && $xsl != NULL) {
    // Got an XML file, XSL file, and we weren't requested raw? Go for it.
    if ($as == "json") {
        header("Content-type:application/json");
    } else {
        header("Content-type:application/xml");
    }
    echo transform($xml, $xsl);
}

?>