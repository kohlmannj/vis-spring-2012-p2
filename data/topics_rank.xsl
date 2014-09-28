<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:output
		method="xml"
		indent="yes"
		version="1.0"
		encoding="us-ascii"
	/>
	
	<xsl:template match="/">
		<tags>
			<xsl:apply-templates select="/tags/tag"/>
		</tags>
	</xsl:template>
	
	<xsl:variable name="stories" select="document('stories.xml')/node_export"/>
	
	<xsl:template match="tag">
		<xsl:variable name="tagIndex" select="@index"/>
		<tag>
			<xsl:attribute name="index">
				<xsl:value-of select="$tagIndex"/>
			</xsl:attribute>
			<xsl:copy-of select="name"/>
			<xsl:copy-of select="desc"/>
			<count><xsl:value-of select="count($stories//n2/*[text()=$tagIndex])"/></count>
		</tag>
	</xsl:template>
	
</xsl:stylesheet>
