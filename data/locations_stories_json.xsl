<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:exslt="http://exslt.org/common"
	xmlns:math="http://exslt.org/math"
	extension-element-prefixes="math"
>
	
	<xsl:output
		method="text"
		indent="no"
		encoding="us-ascii"
	/>
	
	<xsl:key name="nodeID" match="node" use="nid"/>
	<xsl:key name="n2TagIndex" match="taxonomy/n2/*[starts-with(name(), 'n')]" use="text()"/>
	
	<xsl:variable name="topics" select="document('topics.xml')/tags"/>
	<xsl:variable name="stories" select="document('stories.xml')/node_export"/>
	<xsl:variable name="locations" select="/locations"/>
	
	<xsl:template match="/">{
	"name": "Locations",
	"index": 1,
	"children": [
		<xsl:apply-templates select="/locations/loc[not(parent)]"/>
	]
}</xsl:template>
	
	<xsl:template match="loc[not(parent)]">
		<xsl:variable name="locIndex" select="@index"/>
		<xsl:variable name="thisLoc" select="."/>
		<!-- Select this node and all nodes that have this node as their parent -->
		<xsl:variable name="subLocations" select=". | /locations/loc[parent/@index=$locIndex]"/>
		
		<xsl:variable name="allStories">
			<xsl:for-each select="$subLocations">
				<xsl:variable name="thisLocIndex" select="@index"/>
				<xsl:variable name="storiesWithThisLoc" select="$stories//node[ taxonomy/n1/*[ text()=$thisLocIndex ] ]"/>
				<xsl:for-each select="$storiesWithThisLoc">
					<xsl:copy-of select="."/>
				</xsl:for-each>
			</xsl:for-each>
		</xsl:variable>
		
		<!-- Second pass to eliminate dupes! -->
		<xsl:variable name="allUniqueStories">
				<xsl:for-each select="exslt:node-set($allStories)/node">
					<xsl:variable name="thisID" select="nid"/>
					<xsl:if test="generate-id() = generate-id( key('nodeID', $thisID) )">
						<xsl:copy-of select="."/>
					</xsl:if>
			</xsl:for-each>
		</xsl:variable>
		
		<xsl:variable name="allTags">
			<xsl:for-each select="exslt:node-set($allUniqueStories)/node">
				
				<xsl:for-each select="taxonomy/n2/*[starts-with(name(), 'n')]">
					<xsl:variable name="tagIndex" select="text()"/>
					<xsl:if test="generate-id() = generate-id( key('n2TagIndex', text()) )">
						<xsl:copy-of select="$topics/tag[@index=$tagIndex]"/>
					</xsl:if>
				</xsl:for-each>
				
			</xsl:for-each>
		</xsl:variable>
		
		{
			"index": <xsl:value-of select="$locIndex"/>,
			"name": "<xsl:value-of select="name"/>",
			"desc": "<xsl:value-of select="desc"/>",
			"count": <xsl:value-of select="count( exslt:node-set($allUniqueStories)/node )"/>,
			
			"tags": {<xsl:for-each select="exslt:node-set($allTags)/tag">
				<xsl:sort select="@index"/>
				<xsl:variable name="tagIndex" select="@index"/>
				"<xsl:value-of select="$tagIndex"/>": {
					"index": <xsl:value-of select="$tagIndex"/>,
					"name": "<xsl:value-of select="name"/>",
					"desc": "<xsl:value-of select="desc"/>",
					"count": <xsl:value-of select="count( exslt:node-set($allUniqueStories)/node/taxonomy/n2/*[starts-with(name(), 'n') and text()=$tagIndex] )"/>
				}<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>
			},
			
			"locations": {<xsl:for-each select="$subLocations">
				<xsl:sort select="@index"/>
				<xsl:variable name="thisLocIndex" select="@index"/>
				<xsl:variable name="thisLocCount" select="count( exslt:node-set($allUniqueStories)/node/taxonomy/n1/*[starts-with(name(), 'n') and text()=$thisLocIndex] )"/>
				"<xsl:value-of select="$thisLocIndex"/>": {
					"index": <xsl:value-of select="$thisLocIndex"/>,
					"name": "<xsl:value-of select="name"/>"
				}<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>
			},
			
			"children": [
			<xsl:for-each select="exslt:node-set($allUniqueStories)/node">
				<xsl:variable name="thisID" select="nid"/>
				<xsl:if test="generate-id() = generate-id( key('nodeID', $thisID) )">
					{
						"name": "<xsl:value-of select="title"/>",
						"nid": <xsl:value-of select="nid"/>,
						"teaser": "<xsl:value-of disable-output-escaping="yes" select="translate(teaser, '&quot;', '')"/>",
						"locations": [<xsl:for-each select="taxonomy/n1/*[starts-with(name(), 'n')]">
							<xsl:sort select="text()"/>
							<xsl:variable name="thisLocIndex" select="text()"/>
							<xsl:variable name="thisLocDupe" select="$locations/loc[@index=$thisLocIndex]"/>
								{
									"index": <xsl:value-of select="$thisLocIndex"/>,
									"name": "<xsl:copy-of select="$thisLocDupe/name"/>",
									"desc": "<xsl:value-of select="$thisLocDupe/desc"/>"
								}<xsl:if test="position()!=last()">,</xsl:if>
						</xsl:for-each>],

						"tags": [<xsl:for-each select="taxonomy/n2/*[starts-with(name(), 'n')]">
							<xsl:variable name="tagIndex" select="text()"/>
							<xsl:value-of select="$tagIndex"/>
							<!-- "<xsl:value-of select="$topics/tag[@index=$tagIndex]/name"/>" --><xsl:if test="position()!=last()">,</xsl:if>
							</xsl:for-each>]

					}<xsl:if test="not( position()=last() )">,</xsl:if>
				</xsl:if>
			</xsl:for-each>
			]
		}<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template>
	
</xsl:stylesheet>
